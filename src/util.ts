const { app } = require('@electron/remote');
import path from "path"
import { readdir, readdirSync, existsSync, lstatSync, unlinkSync } from 'fs'
const { exec } = require("child_process");

const appData = app.getPath('appData')
const appDataLocal = appData.replace('\\Roaming', '') + '\\Local'

const delay = (ms:number) => new Promise(resolve => setTimeout(resolve, ms))


const cacheFoldersFirefox = () => {

    const ProfilesFolder = appDataLocal + '\\Mozilla\\Firefox\\Profiles'

    if(!existsSync(ProfilesFolder)) return []

    return readdirSync(ProfilesFolder, { withFileTypes: true })
        .filter(dirent => {
            try{
                lstatSync(appDataLocal + '\\Mozilla\\Firefox\\Profiles\\' + dirent.name + '\\cache2').isDirectory()
                return true
            }
            catch{
                return false
            }
        })
        .map(dirent => appDataLocal + '\\Mozilla\\Firefox\\Profiles\\' + dirent.name + '\\cache2')
}

const cookieFilesFirefox = () => {

    const ProfilesFolder = appData + '\\Mozilla\\Firefox\\Profiles'

    if(!existsSync(ProfilesFolder)) return []

    return readdirSync(ProfilesFolder, { withFileTypes: true })
        .filter(dirent => {
            try{
                lstatSync(appData + '\\Mozilla\\Firefox\\Profiles\\' + dirent.name + '\\cookies.sqlite').isDirectory()
                return true
            }

            catch{
                return false
            }
        })
        .map(dirent => appData + '\\Mozilla\\Firefox\\Profiles\\' + dirent.name + '\\cookies.sqlite')

}



interface ICleanerPoint {
    [key: string]:{
        type: 'folder' | 'cmd',
        data: Array<string>
    }
}


// type PointType = Record<string, ICleanerPoint>

interface ICLeaner {
    points: ICleanerPoint,
    pointsArray: Function,
    clean: Function,
    deleteElement:Function,
    isFile: Function,
    isDirectory: Function
}

const cleaner:ICLeaner = {

    points:{
        'Prefetch': {
            type: 'folder',
            data: [
                'C:\\Windows\\Prefetch'
            ]
        },

        'Temp': {
            type: 'folder',
            data: [
                'C:\\Temp',
                'C:\\Windows\\Temp',
                appDataLocal + '\\Temp'
            ]
        },
        
        'Cache': {
            type: 'folder',
            data: [
                ...cacheFoldersFirefox(), // Mozilla Firefox
                appDataLocal + '\\Google\\Chrome\\User Data\\Default\\Cache\\Cache_Data', // Google Chrome
                appDataLocal + '\\Yandex\\YandexBrowser\\User Data\\Default\\Cache\\Cache_Data', // Yandex Browser
                appDataLocal + '\\Microsoft\\Edge\\User Data\\Default\\Cache\\Cache_Data', // Microsoft Edge
                appDataLocal + '\\Opera Software\\Opera Stable\\Cache\\Cache_Data', // Opera
                appDataLocal + '\\Opera Software\\Opera GX Stable\\Cache\\Cache_Data', // Opera GX
                appDataLocal + '\\Opera Software\\Opera Crypto Stable\\Cache\\Cache_Data' // Opera Crypto Browser
            ]
        },

        'Nvidia Cache': {
            type: 'folder',
            data: [
                appDataLocal + '\\NVIDIA\\GLCache'
            ]
        },

        'Cookie': {
            type: 'folder',
            data: [
                ...cookieFilesFirefox(),
                appDataLocal + '\\Google\\Chrome\\User Data\\Default\\Network', // Google Chrome
                appDataLocal + '\\Yandex\\YandexBrowser\\User Data\\Default\\Network', // Yandex Browser
                appDataLocal + '\\Microsoft\\Edge\\User Data\\Default\\Network', // Microsoft Edge
                appData + '\\Opera Software\\Opera Stable\\Network', // Opera
                appData + '\\Opera Software\\Opera GX Stable\\Network', // Opera GX
                appData + '\\Opera Software\\Opera Crypto Stable\\Network' // Opera Crypto Browser

            ]
        },

        'Recycle Bin (bad work)': {
            type: 'folder',
            data: [
                'C:\\$RECYCLE.BIN'
            ]
        },

        'DNS Cache': {
            type: 'cmd',
            data: ['ipconfig /flushdns']
        },

        'Software Distribution': {
            type: 'folder',
            data: [
                'C:\\Windows\\SoftwareDistribution\\Download'
            ]
            
        }
    },


    isFile(path:string){
        return lstatSync(path).isFile()
    },

    isDirectory(path:string){
        try{
            lstatSync(path).isDirectory()
            return true
        }
        catch{
            return false
        }
    },


    deleteElement(directory:string, noDeletesElements:number){
        try{
           unlinkSync(directory)

        }
        catch(err){
            console.log(directory, err)
            noDeletesElements ++;
            return true
        }
        
    },

    pointsArray ()  {
        return Object.keys(this.points)
    },

    async clean (pointsSelected:Array<string>, setProgress: (progress:number) => void, setProgressText: (progressText: string) => void, setDisabled: (disabled: boolean) => void) {

        console.log('Старт')
        setDisabled(true)
        setProgress(0)
        setProgressText(`1/${pointsSelected.length} выполнение`)

        let pointIndex = 1

        for(let point of pointsSelected){
            let pointData = this.points[point]
            let noDeletesElements = 0

            if(pointData.type === 'folder'){

                for(let data of pointData.data){

                    console.log(data)
                    if(!existsSync(data)) continue
                    if(this.isFile(data)) {
                        console.log('delete ', data)
                        this.deleteElement(data, noDeletesElements)
                        continue
                    }  

                    else{ 
                        readdir(data, (err, files) => {
                            files.forEach((file) => {
                                if(err) return console.log('error read')

                                console.log('delete ', file)

                                this.deleteElement(path.join(data, file), noDeletesElements)
                            })
                        })
                    }
                }
            }

            else if (pointData.type === 'cmd'){
                for(let data of pointData.data){
                    try{
                        exec(data)
                    }
                    catch(err){
                        console.log(err)
                    }

                }
            }

            pointIndex++
            if(pointIndex === pointsSelected.length + 1) {
                setProgress(100)
                setProgressText(`Выполнено`)
                setDisabled(false)
    
                await delay(3000)
    
                setProgress(0)
                setProgressText("0%")
    
                return
            }
    
            setProgress(0)
            setProgressText(`${pointIndex}/${pointsSelected.length} выполнение`)

        }

    }

}


export default cleaner;
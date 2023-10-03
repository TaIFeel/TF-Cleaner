import { useState, Children, useEffect } from 'react'
import Point from '@components/Point'
import Button from '@components/Button'
import ProgrssBar from '@components/ProgrssBar'
import cleaner from './util'
import { GrFormClose, GrFormSubtract } from 'react-icons/gr'
import './App.css'

const ipc = require('electron').ipcRenderer

console.log(`Electron: ${process.versions.electron}!\nNode: ${process.versions.node}\nChrome: ${process.versions.chrome}\nPlatform: ${process.platform}\nARM: ${process.arch}`)

function App() {

  const [pointsSelected, setPointsSelected] = useState<string[]>(cleaner.pointsArray())
  const [progress, setProgress] = useState<number>(0)
  const [propgressText, setProgressText] = useState<string>("0%")
  const [disabled, setDisabled] = useState<boolean>(false)
  const [opacity, setOpacity] = useState<boolean>(false)

  useEffect(() => {
    if(pointsSelected.length === 0) setDisabled(true)
    else setDisabled(false)
  }, [pointsSelected])


  const toggleAll = () => {
    console.log(cleaner.points)
    console.log(cleaner.pointsArray)
    if(pointsSelected.length === 8){
      return setPointsSelected([])
    }

    return setPointsSelected(cleaner.pointsArray())
  }

  const minimize = () => {
    setOpacity(true)
    setTimeout(()=> {
      ipc.invoke('minimize')
      setOpacity(false)
    }, 200)
  }

  return (
    <div className={`App font-mono font-normal text-xl transition-all duration-200 ${opacity? 'opacity-0': 'opacity-100'}`}>
      <div className='title-bar w-full flex justify-end h-7 bg-neutral-900 border border-neutral-700 border-1 rounded-lg'>
        <GrFormSubtract className='close-icon h-full stroke-neutral-100 rounded-lg hover:bg-neutral-800 ; cursor-pointer' size={24}  onClick={minimize}/>
        <GrFormClose className='close-icon h-full stroke-neutral-100 rounded-lg hover:bg-[red] ; cursor-pointer' size={24} onClick={() => ipc.invoke('close')}/>
        </div>
      <div className='justify-between flex row-auto flex-wrap gap-y-2 mt-4'>
        {Children.map(cleaner.pointsArray(), point => 
          <Point points={pointsSelected} setPoints={setPointsSelected}>{point}</Point>
          )}
      </div>
      <div className='justify-between flex row-auto flex-wrap gap-y-2 mt-6'>
        <Button onClick={toggleAll}>{pointsSelected.length === 8? 'Отменить всё':'Выбрать всё'}</Button>
        <Button disabled={disabled} onClick={async() => await cleaner.clean(pointsSelected, setProgress, setProgressText, setDisabled)}>Запустить очистку</Button>
      </div>
      <ProgrssBar progress={progress} progressText={propgressText}/>
    </div>
  )
}

export default App

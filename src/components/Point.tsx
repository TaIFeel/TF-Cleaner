

export default function Button(props:any){

    const handlePoint = () => {

        if(props.points.includes(props.children)){
            return props.setPoints(props.points.filter((name:any) => name !== props.children))
        }

        props.setPoints((points:any)=> [...points,props.children])

    }

    return(
        <div onClick={handlePoint} className={`flex w-[48%] h-14 rounded-lg 
        transition ease-in-out duration-75
        select-none hover:bg-neutral-800 ; cursor-pointer 
        bg-neutral-900 border border-neutral-700 border-1
        justify-center items-center text-center 
        ${props.points.includes(props.children) ? 'opacity-100': 'opacity-50'}`}>{props.children}</div>
    )
}
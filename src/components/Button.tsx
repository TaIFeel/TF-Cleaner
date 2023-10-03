

export default function(props:any){
    return(
        <button disabled={props.disabled} className={`flex w-[100%] h-14 rounded-lg
        bg-neutral-900 border border-neutral-700 border-1
        select-none outline-0 transition ease-in-out duration-75
        justify-center items-center text-center ${props.disabled && 'opacity-50'} 
        ${!props.disabled && 'hover:bg-neutral-800 ; cursor-pointer'}`} onClick={props.onClick} children={props.children}></button>
    )
}
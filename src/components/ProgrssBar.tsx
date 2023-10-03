interface progress {
    progress: number,
    progressText: string,
}

export default function progress(props:progress){
    return(
        <progress className='progress-bar flex w-[100%] h-14 mt-6' max="100" value={props.progress} data-label={props.progressText}/>
    )
}
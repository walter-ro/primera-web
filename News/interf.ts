interface Window {
    eliminarNoticiaUI: (noticiaId: number) => void;
}

interface Window {
    resolverReporteUI: (reporteId: number, accion: string) => void;
}

interface Window {
    submitCrearSubAdmin: (e: Event) => boolean;
}

interface Window {
    eliminarNoticiaAdmin: (reporteId: number, accion: string) => void;
}

interface Window {
    reportarNoticiaUI: (reporteId: number, accion: string) => void;
}

interface Window {
    enviarComentario: (reporteId: number, accion: string) => void;
}

interface Window {
    eliminarComentarioUI: (reporteId: number, accion: string) => void;
}
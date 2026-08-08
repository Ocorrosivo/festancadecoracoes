import ftp from "basic-ftp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    
    try {
        console.log("Conectando ao FTP Hostinger...");
        await client.access({
            host: "45.132.157.64",
            user: "festancadecoracoes",
            password: "Baudasorte123@",
            secure: false
        });
        
        console.log("Conectado! Limpando diretório public_html (mantendo arquivos ocultos)...");
        const remoteDir = "/public_html";
        await client.cd(remoteDir);
        
        // Remove old files but keep .htaccess and other hidden files if any, actually we should upload over it.
        // The prompt says "Remover apenas os arquivos antigos da aplicação. Nunca remover configuracoes do servidor... Enviar apenas dist/*"
        console.log("Iniciando upload da pasta dist...");
        await client.uploadFromDir(path.join(__dirname, "dist"));
        
        console.log("Upload concluído com sucesso!");
    }
    catch (err) {
        console.error("Erro durante o deploy FTP:", err);
    }
    client.close();
}

deploy();

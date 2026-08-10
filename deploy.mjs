import ftp from "basic-ftp";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { FTP_HOST, FTP_USER, FTP_PASSWORD } = process.env;
const FTP_SECURE = process.env.FTP_SECURE === "true";
// O login FTP desta conta já cai dentro do docroot (public_html).
// Por isso o default é "." — NÃO usar "public_html" aqui, senão cria
// public_html/public_html aninhado.
const FTP_REMOTE_DIR = process.env.FTP_REMOTE_DIR || ".";

if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
    console.error("Erro: defina FTP_HOST, FTP_USER e FTP_PASSWORD no .env antes de rodar o deploy.");
    process.exit(1);
}

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        console.log("Conectando ao FTP Hostinger...");
        await client.access({
            host: FTP_HOST,
            user: FTP_USER,
            password: FTP_PASSWORD,
            secure: FTP_SECURE
        });
        
        console.log(`Conectado! Enviando dist/ para "${FTP_REMOTE_DIR}"...`);
        await client.uploadFromDir(path.join(__dirname, "dist"), FTP_REMOTE_DIR);
        
        console.log("Upload concluído com sucesso!");
    }
    catch (err) {
        console.error("Erro durante o deploy FTP:", err);
    }
    client.close();
}

deploy();

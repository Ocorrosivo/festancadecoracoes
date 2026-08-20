import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { invokeAdminData } from "@/utils/adminApi";
import { Loader2 } from "lucide-react";

interface Client {
  id?: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  empresa: string | null;
  status: string;
  cidade: string | null;
}

interface AdminClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSuccess: () => void;
}

const AdminClientDialog = ({ open, onOpenChange, client, onSuccess }: AdminClientDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<Client>({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    status: "Ativo",
    cidade: "",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        nome: client.nome || "",
        email: client.email || "",
        telefone: client.telefone || "",
        empresa: client.empresa || "",
        status: client.status || "Ativo",
        cidade: client.cidade || "",
      });
    } else {
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        empresa: "",
        status: "Ativo",
        cidade: "",
      });
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const action = client?.id ? "update" : "create";
      await invokeAdminData({
        resource: "clients",
        action,
        id: client?.id,
        payload: formData,
      });

      toast({ title: client?.id ? "Cliente atualizado com sucesso" : "Cliente cadastrado com sucesso" });

      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error(error);
      const errMsg = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao salvar cliente",
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{client?.id ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Maria Silva"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="maria@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <MaskedInput
                id="telefone"
                mask="phone"
                value={formData.telefone || ""}
                onAccept={(val: string) => setFormData({ ...formData, telefone: val })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                value={formData.empresa || ""}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                placeholder="Nome da empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade || ""}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                placeholder="Ex: São Paulo"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {client?.id ? "Salvar alterações" : "Cadastrar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminClientDialog;
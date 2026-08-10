-- Ativa os perfis admin existentes (se já tiverem sido criados via Auth)
-- e garante role "Master" para as contas principais.

UPDATE public.profiles
SET status = 'Ativo', role = 'Master'
WHERE email IN (
  'festanca.decoracoes@outlook.com',
  'suprememidias.ok@gmail.com'
);

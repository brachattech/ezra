import { supabase } from './supabaseClient';

// Criar usuário
export async function createUser(name: string, email: string) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email }])
    .select();

  if (error) throw error;
  return data;
}
// Salvar mensagem
export async function saveMessage(
  userId: string,
  sessionId: string,
  role: 'user' | 'ezra',
  iaProvider: string,
  input: string,
  output: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      user_id: userId,
      session_id: sessionId,
      role,
      ia_provider: iaProvider,
      input,
      output
    }]);

  if (error) throw error;
  return data;
}
// Consultar histórico de mensagens
export async function getUserMessages(userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
// Salvar prompt
export async function savePrompt(userId: string, title: string, content: string) {
  const { data, error } = await supabase
    .from('prompts')
    .insert([{ user_id: userId, title, content }]);

  if (error) throw error;
  return data;
}
// Excluir memória do usuário
export async function deleteUserMemory(userId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}
// Cadastro de novo usuário
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}
// Login de usuário existente
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

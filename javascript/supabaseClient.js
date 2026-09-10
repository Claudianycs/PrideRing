// supabaseClient.js - conexão com o banco Supabase do PRiDeRing

const SUPABASE_URL = "https://kcgeqpekxpjnjlrptpug.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ2VxcGVreHBqbmpscnB0cHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNjAwMzYsImV4cCI6MjEwNDYzNjAzNn0.SZeBtIH6TF9kBEQihhjxhCGhPhQomj-yirzdxc0Qnvg";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseClient = supabaseClient;

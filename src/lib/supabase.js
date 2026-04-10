import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rbkqvceaurhowwikzhic.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia3F2Y2VhdXJob3d3aWt6aGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjM5MjcsImV4cCI6MjA5MTMzOTkyN30.o_jxcTTbEcROPKhRLGgPm2z6qeGqDvkuQq4gLWvtwOw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
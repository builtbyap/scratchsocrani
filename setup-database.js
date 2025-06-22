const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease check your .env.local file and ensure these variables are set.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database schema...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-database.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message)
        console.error('Statement:', statement)
        continue
      }
      
      console.log(`✅ Statement ${i + 1} executed successfully`)
    }
    
    console.log('\n🎉 Database setup completed!')
    console.log('\nNext steps:')
    console.log('1. Restart your development server')
    console.log('2. Try signing in again')
    console.log('3. Check the dashboard access')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  }
}

// Alternative method using direct SQL execution
async function setupDatabaseAlternative() {
  try {
    console.log('🔧 Setting up database schema (alternative method)...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-database.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📝 Executing SQL statements...')
    
    // Execute the entire SQL content
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent })
    
    if (error) {
      console.error('❌ Error executing SQL:', error.message)
      console.log('\n💡 Trying alternative approach...')
      
      // Try executing statements one by one
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        if (statement.length === 0) continue
        
        console.log(`\n🔄 Executing: ${statement.substring(0, 50)}...`)
        
        try {
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement })
          if (stmtError) {
            console.error(`❌ Error: ${stmtError.message}`)
          } else {
            console.log(`✅ Success`)
          }
        } catch (err) {
          console.error(`❌ Exception: ${err.message}`)
        }
      }
    } else {
      console.log('✅ Database setup completed successfully!')
    }
    
    console.log('\n🎉 Database setup process finished!')
    console.log('\nNext steps:')
    console.log('1. Restart your development server')
    console.log('2. Try signing in again')
    console.log('3. Check the dashboard access')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  }
}

// Check if we can connect to Supabase
async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('⚠️  Connection test failed (this might be expected if table doesn\'t exist yet):', error.message)
    } else {
      console.log('✅ Connection to Supabase successful')
    }
    
    return true
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
    return false
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting database setup...\n')
  
  const connected = await testConnection()
  if (!connected) {
    console.log('\n💡 Please check your environment variables and try again.')
    return
  }
  
  // Try the alternative method first
  await setupDatabaseAlternative()
}

main() 
import { runSeeders, uploadDefaultImages } from '../seeders'

async function main() {
  console.log('Executando seeders...')
  
  try {
    await runSeeders()
    await uploadDefaultImages()
    console.log('Seeders executados com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('Erro ao executar seeders:', error)
    process.exit(1)
  }
}

main()

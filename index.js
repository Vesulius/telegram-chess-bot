require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const chessEngine = require('js-chess-engine')

const token = process.env.API_TOKEN

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true })

let game = null

bot.onText(/start/, (msg, match) => {
  const chatId = msg.chat.id
  game = new chessEngine.Game()
  const status = game.exportJson()
  console.log(status)
  game.printToConsole()
  console.log(boardString(game))

  bot.sendMessage(chatId, 'GAME ON!')
})

const boardString = game => {
  if (!game) return ''

  const emptyRow = () => Array(8).fill(' ')
  const emptyBoard = () => Array(8).fill(emptyRow())

  const moves = game.exportJson().pieces
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

  const intSpace = move => {
    const xy = move.split('')
    const x = letters.indexOf(xy[0])
    const y = +xy[1]
    return [x, y]
  }

  const newBoard = emptyBoard()

  for (move in moves) {
    console.log(moves[move])
    const xy = intSpace(move)
    newBoard[xy[0]][xy[1]] = moves[move]
  }

  const str = newBoard.map(row => row.join(' ')).join('\n')

  return str
}

bot.onText(/state/, (msg, match) => {
  if (game === null) {
    bot.sendMessage(chatId, 'begin new game with "start"')
    return
  }
  const gameState = boardState(game)

  bot.sendMessage(chatId, gameState)
})

bot.onText(/\D\d/, (msg, match) => {
  const chatId = msg.chat.id

  const moves = match[1]
  console.log(moves)

  bot.sendMessage(chatId, `moved`)
})

bot.onText(/ping/, (msg, match) => {
  const chatId = msg.chat.id
  game = new chessEngine.Game()
  game.printToConsole()

  bot.sendMessage(chatId, 'pong')
})

bot.on('message', msg => {
  const chatId = msg.chat.id

  bot.sendMessage(chatId, 'Received your message')
})

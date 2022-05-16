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
  game.printToConsole()
  const status = game.exportJson()
  console.log(status)
  console.log(boardString(game))

  bot.sendMessage(chatId, 'GAME ON!')
})

const boardString = game => {
  if (!game) return ''

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const moves = game.exportJson().pieces

  const emptyRow = () => Array(8).fill('–')
  const emptyBoard = () =>
    Array(8)
      .fill(null)
      .map(v => emptyRow())

  const addBoarders = board => {
    let empty = board
    empty = empty.map((r, i) => [i + 1, ...r])
    return [['–', ...letters], ...empty]
  }

  const intSpace = move => {
    const xy = move.split('')
    const x = letters.indexOf(xy[0])
    const y = xy[1] - 1
    return [x, y]
  }

  const newBoard = emptyBoard()

  for (move in moves) {
    const xy = intSpace(move)
    newBoard[xy[1]][xy[0]] = moves[move]
  }

  const str = addBoarders(newBoard)
    .map(row => row.join(' '))
    .join('\n')
  return str
}

bot.onText(/board/, (msg, match) => {
  if (!game) {
    bot.sendMessage(chatId, 'begin new game with "start"')
    return
  }

  const chatId = msg.chat.id
  const board = boardString(game)

  bot.sendMessage(chatId, board)
})

bot.onText(/\D\d\D\d/, (msg, match) => {
  const chatId = msg.chat.id

  const from = match[0].substring(0, 2)
  const to = match[0].substring(2, 4)
  console.log(game.move(from, to))
  console.log(game.aiMove());

  bot.sendMessage(chatId, 'moved')
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

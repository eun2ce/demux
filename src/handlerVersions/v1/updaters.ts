async function getAccount( state, owner, symbol ) {
   return await state.balances.findOne({ owne: owner, token: symbol }, { field:['amount'] })
}
async function getSymbol( state, symbol) {
   return await state.token_state.findOne({ token: symbol }, {field:['token_precision']})
}
function findFloatToken( tokenString ) {
   const [ amountString, tokens ] = tokenString.split(" ")
   const words = amountString.split('.')
   return words.length > 1 ? words[1].length : 0
}

function parseTokenString( tokenString ) {
   const [ amountString, tokens ] = tokenString.split(" ")
   console.info("amountString",amountString,"findFloatToken",findFloatToken(amountString))
   const amount = Math.floor(parseInt(amountString.padEnd('0',findFloatToken(amountString))))
   console.info("amount:", amount)
   //const amount = Math.floor(parseFloat(amountString) *  )

   if(tokens.indexOf("@")){
      const _token = String(tokens)
      const [ token, game_account_name ] = _token.split("@")
      return { amount, token, game_account_name }
   }
   return { amount, tokens }
}

async function balanceUpdate( state, payload, blockInfo, context ) {
   const { amount, token, game_account_name } = parseTokenString(payload.data.value)

   const from_ = payload.data.from
   const to_ = payload.data.to
   const token_ = String(token)
   const from = await getAccount(state, from_, token_)
   const to = await getAccount(state, to_, token_)

   if ( payload.data.from != "gxc.null" ) {

      if (from !== null && parseInt(from.amount) - amount === 0) {
         state.balances.destroy({owner: from.owner, token: from.token},{only: true})
      }

      if (from === null) {
         const res = await state.balances.insert({
            game_account_name: game_account_name,
            owner: payload.data.from,
            amount: -amount,
            token: token
         })
      } else {
         await state.balances.update (
             { owner: from_, token: token },
             { amount: parseInt(from.amount) - amount }
         )}
   }

   if (payload.data.to != "gxc.null") {
      if (to === null) {
         const res = await state.balances.insert({
            game_account_name: game_account_name,
            owner: payload.data.to,
            amount: amount,
            token: token
         })
      } else { await state.balances.update (
             { owner: to_, token: token },
             { amount: parseInt(to.amount) + amount }
         )}
   }
}

async function mint (state, payload, blockInfo, context) {
   const { amount, token, game_account_name } = parseTokenString(payload.data.value)
   const exist_token = await getSymbol(state, token)

   if (exist_token === null) {
      const token_precision_ = findFloatToken( payload.data.value )
      const res = await state.token_state.insert({
         game_account_name: game_account_name,
         token: token,
         token_precision: token_precision_
      })
   }
   const res = await state.mints.insert({
      trx_id: payload.transactionId,
      amount: amount,
      token: token,
      game_account_name: game_account_name,
      block_time: blockInfo.timestamp
   })
}

async function transfer (state, payload, blockInfo, context) {
   const { amount, token, game_account_name } = parseTokenString(payload.data.value)
   const res = await state.transfers.insert({
      trx_id: payload.transactionId,
      receiver: payload.data.to,
      sender: payload.data.from,
      amount: amount,
      token: token,
      game_account_name: game_account_name,
      block_time: blockInfo.timestamp,
      block_number: blockInfo.blockNumber
   })
}

exports.updaters = [
   {
      actionType: "gxc.token::mint",
      apply: mint,
   },
  {
    actionType: "gxc.token::transfer",
    apply: transfer,
  },
  {
    actionType: "gxc.token::transfer",
    apply: balanceUpdate,
   },
]

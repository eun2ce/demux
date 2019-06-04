async function getAccount( state, owner, symbol ) {
   return await state.balances.findOne(
      {
         owner,
         token: symbol,
      },
      {
         field: ["amount"],
      },
   );
}

async function getSymbol( state, symbol) {
   return await state.token_state.findOne(
      {
         token: symbol,
      },
      {
         field: ["token_precision"],
      },
   );
}

function pad(n, width) {
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join("0") + n;
}

/*
function findFloatToken( tokenString ) {
   const [ amountString, tokens ] = tokenString.split(" ");
   const words = amountString.split(".");
   return words.length > 1 ? words[1].length : 0;
}
*/

function parseTokenString( tokenString ) {
   const amount = parseInt(tokenString.quantity.amount, 10);
   const token = tokenString.sym.code;

   if ( tokenString.contract ) {
      const gameAccountName = tokenString.contract;
      return { amount, token, gameAccountName };
   }
   return { amount, token };
}

async function balanceUpdate( state, payload, blockInfo, context ) {
   const { amount, token, gameAccountName } = parseTokenString(payload.data.value);

   const sender = payload.data.from;
   const receiver = payload.data.to;
   const tokenString = String(token);
   const from = await getAccount(state, sender, tokenString);
   const to = await getAccount(state, receiver, tokenString);

   if ( payload.data.from !== "gxc.null" ) {

      if (from !== null && parseInt( from.amount, 10 ) - amount === 0) {
         state.balances.destroy (
            {
               owner: from.owner,
               token: from.token,
            },
            {
               only: true,
            },
         );
      }

      if (from === null) {
         const res = await state.balances.insert (
            {
               amount: -amount,
               game_account_name: gameAccountName,
               owner: payload.data.from,
               token,
            },
         );
      } else {
         await state.balances.update (
            {
               owner: sender,
               token,
            },
            {
               amount: parseInt( from.amount, 10 ) - amount,
            },
         );
      }
   }

   if (payload.data.to !== "gxc.null") {
      if (to === null) {
         const res = await state.balances.insert(
            {
               amount,
               game_account_name: gameAccountName,
               owner: payload.data.to,
               token,
            },
         );
      } else {
         await state.balances.update (
            {
               owner: receiver,
               token,
            },
            {
               amount: parseInt( to.amount, 10 ) + amount,
            },
         );
      }
   }
}

// check
async function mint(state, payload, blockInfo, context) {
   const { amount, token, gameAccountName } = parseTokenString( payload.data.value );
   const existToken = await getSymbol(state, token);

   if (existToken === null) {
      const tokenPrecision = payload.data.value.quantity.sym.decimals;
      // const tokenPrecision = findFloatToken( payload.data.value );
      const stateres = await state.token_state.insert(
         {
         game_account_name: gameAccountName,
         token,
         token_precision: tokenPrecision,
         },
      );
   }

   const mintres = await state.mints.insert(
      {
         amount,
         block_time: blockInfo.timestamp,
         game_account_name: gameAccountName,
         token,
         trx_id: payload.transactionId,
      },
   );
}

async function transfer(state, payload, blockInfo, context) {
   const { amount, token, gameAccountName } = parseTokenString(payload.data.value);
   const actId = payload.transactionId + pad(payload.actionIndex, 2);
   const res = await state.transfers.insert(
      {
         amount,
         block_number: blockInfo.blockNumber,
         block_time: blockInfo.timestamp,
         game_account_name: gameAccountName,
         receiver: payload.data.to,
         sender: payload.data.from,
         token,
         act_id: actId, // ignore tslint sorted alphabetically
      },
   );
}

const updaters = [
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
];

export { updaters };

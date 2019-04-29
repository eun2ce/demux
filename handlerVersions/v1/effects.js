
function logUpdate(payload, blockInfo, context) {
//  console.info("State updated:\n", JSON.stringify(context.stateCopy, null, 2))
   console.info("transfer payload:",payload)
}

exports.effects = [
  {
     actionType: "gxc.token::transfer",
    run: logUpdate,
  },
]


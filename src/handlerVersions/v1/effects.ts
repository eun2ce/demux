function logUpdate(payload, blockInfo, context) {
   //   console.info("transfer payload:",payload)
}

const effects = [
   {
      actionType: "gxc.token::transfer",
      run: logUpdate,
   },
];
export { effects };

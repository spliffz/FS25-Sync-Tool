// Statistics v1.0
// 
// This collects anonymous statstics.
// No personal information will be gathered!
// Look, I don't like this either, but I've no other way of knowing how many times the program is used
// and I like to have a minimum amount of statistics so I know a bit more about the usage. That's all.
//
// So what this does is the following:
//   - It gathers your hwid (which is an unique identifier for each pc/system) and is completely anonymous. it looks something like 33198d3e-bdc6-7a22-9291-244bfe9a2a4c
//   - It collects your IP address. Look, this isn't a new thing. been around for decades. Don't like it then use a VPN :)
//   - I might extend this in the future, but if so I'll give reasoning and explanation for it.
//   - for now I just want 'some' usage numbers.
//   - And I thought about making the statistics page public.. we'll see :)
//
// I hope you can understand.
//
// ----------------------------------------------------------------------------------------------------

const si = require('systeminformation')
const crypto = require('crypto')


export async function upStats() {
  let timehash = crypto.createHash('md5').update(Date.now().toString()).digest('hex')
  // let timehash = '0'

  si.system()
    .then((data) => {
      console.log(data.uuid)
      let hwid = data.uuid
      let fetched = fetch('https://fs25.rotjong.xyz/stats.php?req=statUp&hwid=' + hwid + '&t=' + timehash)
        .then((res) => res.text())
        .then((data) => {
          // console.log(data)
        })
        .catch((err) => {
          console.log('error: ' + err)
        })
    })
    .catch((error) => console.log(error))



}
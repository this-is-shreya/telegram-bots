const app = require("express")() // For creating the server
const {Telegraf,session, Scenes:{Stage, WizardScene}, Telegram} = require("telegraf") 
const dotenv = require("dotenv")  // For reading the .env file
dotenv.config({path:"./config.env"})  // For reading the .env file
const bot = new Telegraf(process.env.BOT_TOKEN)

app.get("/",(req,res)=>{
    res.send("working")
})
const course = new WizardScene("choose course",
async(ctx)=>{
    ctx.reply(`Hey There! What would you like to do?`,
    {
        reply_markup:{
            inline_keyboard:[
                [
                    {
                        text:"Book a ride",
                        callback_data:"book"
                    },
                    {
                        text:"Cancel ride",
                        callback_data:"cancel"
                    },
                    {
                        text:"Call customer care",
                        callback_data:"call"
                    }
                ]
            ]
        }
    })
    return ctx.wizard.next()

},
async(ctx)=>{
    if(ctx.callbackQuery == undefined){
        ctx.reply("Incorrect input. Bot has left the chat")
        ctx.scene.leave()
    }
    else if(ctx.callbackQuery.data == "book"){
        ctx.answerCbQuery()
        ctx.wizard.state.domain = ctx.callbackQuery.data
        ctx.reply("Choose location:",{
            reply_markup:{
                inline_keyboard:[
                    [
                        {
                            text:"Current location",
                            callback_data:"k",
                            request_location:true
                        },
                        {
                            text:"Type a different location",
                            callback_data:"diff-location"
                        }
                    ]
                ]
            }
        })

        return ctx.wizard.next()

    }
    else if(ctx.callbackQuery.data == "cancel"){
        ctx.answerCbQuery()

        ctx.wizard.state.domain = ctx.callbackQuery.data

        ctx.reply("Are you sure you want to cancel your ride?",{
            reply_markup:{
                inline_keyboard:[
                    [
                        {
                            text:"Yes",
                            callback_data:"yes-cancel"
                        },
                        {
                            text:"No",
                            callback_data:"no-cancel"
                        }
                    ]
                ]
            }
        })

        return ctx.wizard.next()
    }
    else{
        ctx.reply("Customer care number: 1234567890")
        ctx.scene.leave()
    }
},
async(ctx)=>{

    if(ctx.callbackQuery == undefined){
        ctx.reply("Incorrect input. Bot has left the chat")
        ctx.scene.leave()
    }
    else if(ctx.callbackQuery.data == "no-cancel"){
        ctx.answerCbQuery()
        ctx.scene.leave()
    }
    else if(ctx.callbackQuery.data == "yes-cancel"){
        ctx.answerCbQuery()
        ctx.reply(`Your ride has been cancelled.`)
        ctx.scene.leave()

    }
    else if(ctx.callbackQuery.data == "diff-location"){
        ctx.answerCbQuery()
        ctx.reply(`Please enter your pickup location`)
        return ctx.wizard.next()

    }
    else{
        ctx.answerCbQuery()
        console.log(ctx.message.location)
        ctx.wizard.state.location = ctx.message.location
        return ctx.wizard.next()
        
    }

},
async(ctx)=>{
    if(ctx.message.text !== undefined){
        ctx.wizard.state.location = ctx.message.text
        
    }
    console.log(ctx.message.text)
    ctx.reply("Please enter your destination")
    return ctx.wizard.next()
},
async(ctx)=>{


    ctx.wizard.state.destination = ctx.message.text
    ctx.reply(`You have entered:
Pickup location: ${ctx.wizard.state.location}
Destination: ${ctx.wizard.state.destination}
Do you wish to confirm?`,{
    reply_markup:{
        inline_keyboard:[
            [
                {
                    text:"Yes",
                    callback_data:"yes-confirm"
                },
                {
                    text:"No",
                    callback_data:"no-confirm"
                }
            ]
        ]
    }
})
return ctx.wizard.next()
},
async(ctx)=>{
    if(ctx.callbackQuery == undefined){
        ctx.reply("Incorrect input. Bot has left the chat")
        ctx.scene.leave()
    }
    else if(ctx.callbackQuery.data == "yes-confirm"){
        ctx.reply(`<b>Your ride is confirmed!</b>
Driver name: Rahul
Auto number: KN 12 AE 987
Driver's contact: 9876543210
<b>OTP:1234</b>

Will reach in <b>5 minutes</b>`,{ parse_mode: "HTML" })
ctx.scene.leave()

    }

else{
    ctx.reply("Bot has left the chat")
    ctx.scene.leave()
}
}
)
 

session({
    property: 'chatSession',
    getSessionKey: (ctx) => ctx.chat && ctx.chat.id,
})
bot.use(session());

const stage = new Stage([course],{sessionName:'chatSession'})
bot.use(stage.middleware())
stage.register(course)

bot.command("/bookRide",async(ctx)=>{
    console.log("c1")
    ctx.scene.enter("choose course")
})



bot.launch()
const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log("listening at "+PORT)
})
const app = require("express")() // For creating the server
const {Telegraf,session, Scenes:{Stage, WizardScene}} = require("telegraf") 
const dotenv = require("dotenv")  // For reading the .env file
dotenv.config({path:"./config.env"})  // For reading the .env file
const bot = new Telegraf(process.env.BOT_TOKEN)

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
    ctx.wizard.cursor = 0
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
        ctx.wizard.cursor = 1

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
        ctx.wizard.cursor = 1

        return ctx.wizard.next()
    }
    else{
        ctx.reply("Customer care number: 1234567890")
        ctx.scene.leave()
    }
},
async(ctx)=>{
    ctx.wizard.cursor = 2

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
Destination: ${ctx.wizard.state.destination}`)
ctx.scene.leave()
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
    ctx.scene.enter("choose course")
})



bot.launch()
app.listen(3000,()=>{
    console.log("listening at 3000")
})
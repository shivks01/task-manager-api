// const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient
const { MongoClient, ObjectID } = require('mongodb')


const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

MongoClient.connect(connectionURL, { useUnifiedTopology: true }, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log('Unable to connect to database.')
    }
    const db = client.db(databaseName)

    db.collection('tasks').deleteOne({
        description:'task-1'
    }).then((result)=>{
        console.log(result)
    }).catch((error)=>{
        console.log(error)
    })
})
// /Users/shive/mongoDB/bin/mongod.exe --dbpath=/Users/shive/mongoDB-data
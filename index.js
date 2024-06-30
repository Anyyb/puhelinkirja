require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')


const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('tiny'))// käytetään morgan tinya ja näytetään tinyn sisältämät pyynnön perustiedot.
app.use(morgan(':body'))// asetetaan moran käyttämään luotua tokenia ja näyttämään tiedot.

// huomioni: tiedot tulostuivat konsoliin allekkain eivätkä saman tiny formaatin perään, 
// koska olen asettanut sovelluksen käyttämään molempia erikseen. Kokeilin yhdistää, mutta ei toiminut.
// POST /api/persons 200 50 - 3.807 ms
//{"name":"John Snow","number":"040321408"}

//luodaan morgan token nimellä body ja palautetaan pyynnöstä saatu data JSON muodossa (JSON.stringify:llä).
morgan.token('body', function(request, response ) { 
  return JSON.stringify(request.body)
})

//etusivu eli sovelluksen juureen tehtävät pyynnöt
app.get('/',(request, response) => {
  response.send('<h1>Front Page</h1>')
})
// http get pyynnöt polkuun persons
//haetaan tietokannasta collectionista Persons
app.get('/api/persons',(request, response) => {
  Person.find({}).then(result => {
    response.json(result)  
  })
})
// pyynnöt polkuun info, haetaan tiedot tietokannasta 
app.get('/info',(request, response) => {
  Person.find({}).then(result => {
  const contacts= result.length
  response.send(`<h3>Phonebook has info for ${contacts} people <br> ${new Date()} </h3>`)
})
})

//yksittäisen henkilön tiedon tarkastelu tietokannasta.
app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
    response.json(person)
 })
  //palautetaan statuskoodi 404 not found, jos henkilöä ei ole
  if (Person === undefined) {
    response.status(404).end()
  }
})
// numeron poiston pyyntö tietokannasta
app.delete('/api/persons/:number', (request, response) => {
  Person.findOne({number:request.params.number}).then(person =>{
    Person.deleteOne(person)
    response.status(204).end()
  })
})
//luodaan uusi ID numero math.randomilla ja asetetaan luku arvoväliksi 500
//const generateID = () => {
  //const newID=Math.floor(Math.random() * 500)
  //return newID
//}

// henkilön lisäys, tehdään post pyyntö polkuun /api/persons
app.post('/api/persons',(request,response) => {
    const body=request.body

    // käsitellään jos pyynnöstä puuttuu nimi tai numero
    if(!body.name || !body.number ){
      // jos siältöä ei ole annetaan statuskoodi 400 bad request
      return response.status(400).json({
        error: 'name and number cannot be empty'
      })
    }
    // etsitään löytyykö uusi nimi tai numero jo listalta ja tallennetaan tiedot muuttujiin.
    const name = person.find(person => person.name === body.name);
    const number = person.find(person => person.number === body.number);
    //jos pyynnön numero tai nimi löytyy jo listalta,
    if(name || number){
      // ja sisältö on sama annetaan statuskoodi 400 bad request
      return response.status(400).json({
       error: 'name and number must be unigue'
      })
    }
   // const person = {
      //id:generateID(),
      //name: body.name,
      //number:body.number,
   // }
    const person = new Person({
      name: body.name,
      number:body.number,
    })
    
    //persons = persons.concat(person)
    //lisätään henkilö tietokantaan
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
})

//portti .env tiedostosta 
const PORT = process.env.PORT;
//lisätty osoitteet konsoliin helpompaa sivujen seurantaa varten.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}/api/persons`);
  console.log(`Server is running on http://localhost:${PORT}/info`);
  console.log(`Server is running on http://localhost:${PORT}/api/persons/667b1fa95f3382bac6464b30`);
});
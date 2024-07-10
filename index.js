require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
app.use(morgan('tiny'))// käytetään morgan tinya ja näytetään tinyn sisältämät pyynnön perustiedot.
app.use(morgan(':body'))// asetetaan moran käyttämään luotua tokenia ja näyttämään tiedot.


//luodaan morgan token nimellä body ja palautetaan pyynnöstä saatu data JSON muodossa (JSON.stringify:llä).
morgan.token('body', function(request, response ) { 
  return JSON.stringify(request.body)
})

//etusivu eli sovelluksen juureen tehtävät pyynnöt
app.get('/',(request, response) => {
  response.send('<h1>Front Page</h1>')
})
// http get pyynnöt polkuun persons
//haetaan tiedot tietokannan collectionista Persons
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

//henkilön poisto ID:n avulla
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// henkilön lisäys, tehdään post pyyntö polkuun /api/persons
app.post('/api/persons',(request,response,next) => {
    const body=request.body

    // käsitellään jos pyynnöstä puuttuu nimi tai numero
    if(!body.name || !body.number ){
      // jos siältöä ei ole annetaan statuskoodi 400 bad request
      return response.status(400).json({
        error: 'name and number cannot be empty'
      })
    }
    
    const person = new Person({
      name: body.name,
      number:body.number,
    })
    
    //lisätään henkilö tietokantaan
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})
//henkilön tietojen päivitys
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number:body.number,
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})
//virheidenkäsittelyn middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: 'Person validation failed, wrong format ' })
  }
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id'})
  }
  if (error.name === 'NoContent') {
    return response.status(204).send({ error: 'noContent'})
  }
  if (error.name === 'ServerError') {
    return response.status(500).json({ error: 'Internal Server Error'})
  }
  next(error)
}

//portti .env tiedostosta 
const PORT = process.env.PORT;
//lisätty osoitteet konsoliin helpompaa sivujen seurantaa varten.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}/api/persons`);
  console.log(`Server is running on http://localhost:${PORT}/info`);
  console.log(`Server is running on http://localhost:${PORT}/api/persons/667b1fa95f3382bac6464b30`);
})
app.use(errorHandler)
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')


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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
    },
    {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523"
    },
    {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
    },
    {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122"
    },
]
//etusivu eli sovelluksen juureen tehtävät pyynnöt
app.get('/',(request, response) => {
  response.send('<h1>Front Page</h1>')
})
// http get pyynnöt polkuun persons
app.get('/api/persons',(request, response) => {
  response.json(persons)
})
// pyynnöt polkuun info
app.get('/info',(request, response) => {
  const contacts= persons.length
  response.send(`<h3>Phonebook has info for ${contacts} people <br> ${new Date()} </h3>`)
})
//yhden henkilön tietojen näyttämisen, pyynnöt polkuun api/henkilöt/henkilönID
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  //lähetetään palvelimelle vastauksena tiedot jos henkilön ID on olemassa.
  //muutoin palautetaan statuskoodi 404 not found
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})
// numeron poiston pyyntö polkuun api/henkilöt/henkilönNumero
app.delete('/api/persons/:number', (request, response) => {
  const number = Number(request.params.number)
  persons = persons.filter(person => person.number !== number)
  //statuskoodi no content
  response.status(204).end()
})

//luodaan uusi ID numero math.randomilla ja asetetaan luku arvoväliksi 500
const generateID = () => {
  const newID=Math.floor(Math.random() * 500)
  return newID
}

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
    const name = persons.find(person => person.name === body.name);
    const number = persons.find(person => person.number === body.number);
    //jos pyynnön numero tai nimi löytyy jo listalta,
    if(name || number){
      // ja sisältö on sama annetaan statuskoodi 400 bad request
      return response.status(400).json({
       error: 'name and number must be unigue'
      })
    }

    const person = {
      id:generateID(),
      name: body.name,
      number:body.number,
    }
    persons = persons.concat(person)
    response.json(person)
})

//portti .env tiedostosta tai käytetään 3001
const PORT = process.env.PORT || 3001;
//lisätty osoitteet konsoliin helpompaa sivujen seurantaa varten.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}/api/persons`);
  console.log(`Server is running on http://localhost:${PORT}/info`);
  console.log(`Server is running on http://localhost:${PORT}/api/persons/4`);
});
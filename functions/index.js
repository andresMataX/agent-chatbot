const functions = require('firebase-functions')
const cors = require('cors')({ origin: true })
const admin = require('firebase-admin')

const serviceAccountAgent = require('./service-account.json')
const serviceAccountFire = require('./service-account-fire.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountFire),
})

const { SessionsClient } = require('dialogflow')

exports.dialogFlowGateway = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const { queryInput, sessionId } = request.body

    const sessionClient = new SessionsClient({
      credentials: serviceAccountAgent,
    })
    const session = sessionClient.sessionPath('test-agent-uqrp', sessionId)

    const responses = await sessionClient.detectIntent({
      session,
      queryInput,
    })

    const result = responses[0].queryResult

    if (
      result.intent.displayName === 'Default Welcome Intent' ||
      result.intent.displayName === 'Default Fallback Intent' ||
      result.intent.displayName === 'Despedida'
    ) {
      return response.send({ fulfillmentText: result.fulfillmentText })
    }

    if (result.allRequiredParamsPresent === true) {
      const data = {
        queryResult: result,
      }
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
      const url =
        'https://us-central1-agent-neo-dent.cloudfunctions.net/dialogflowWebhook'
      // 'http://127.0.0.1:5001/agent-neo-dent/us-central1/dialogflowWebhook'
      const res = await fetch(url, options)
      const json = await res.json()
      response.send(json)
    } else {
      response.send({ fulfillmentText: result.fulfillmentText })
    }
  })
})

const { WebhookClient } = require('dialogflow-fulfillment')

exports.dialogflowWebhook = functions.https.onRequest(
  async (request, response) => {
    const agent = new WebhookClient({ request, response })

    const result = request.body.queryResult

    const db = admin.firestore()
    const profile = db.collection('users').doc('test_user')

    function fallback(agent) {
      agent.add(result.fulfillmentText)
    }

    async function cambiarContrasenaHandler(agent) {
      await profile.update({
        password: result.queryText,
      })

      agent.add(result.fulfillmentText)
    }

    async function cambiarNombreHandler(agent) {
      await profile.update({
        name: result.queryText,
      })

      agent.add(result.fulfillmentText)
    }

    async function cambiarNombreHandler(agent) {
      await profile.update({
        name: result.queryText,
      })

      agent.add(result.fulfillmentText)
    }

    async function cambiarCorreoHandler(agent) {
      await profile.update({
        email: result.queryText,
      })

      agent.add(result.fulfillmentText)
    }

    async function cambiarTelefonoHandler(agent) {
      await profile.update({
        phone: result.queryText,
      })

      agent.add(result.fulfillmentText)
    }

    let intentMap = new Map()
    intentMap.set('Default Fallback Intent', fallback)
    intentMap.set('CambiarNombre', cambiarNombreHandler)
    intentMap.set('CambiarCorreo', cambiarCorreoHandler)
    intentMap.set('CambiarContrasena', cambiarContrasenaHandler)
    intentMap.set('CambiarTelefono', cambiarTelefonoHandler)
    agent.handleRequest(intentMap)
  }
)

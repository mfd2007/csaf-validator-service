import Fastify from 'fastify'
import closeWithGrace from 'close-with-grace'
import config from 'config'

const app = Fastify({
  logger: true,
})

app.register(import('./lib/app.js'))

const closeListeners = closeWithGrace(
  { delay: 500 },
  async function (/** @type {{ err?: Error }} */ { err }) {
    if (err) {
      app.log.error(err)
    }
    await app.close()
  }
)

app.addHook('onClose', async (_instance, done) => {
  closeListeners.uninstall()
  done()
})

app.listen(config.get('port'), '0.0.0.0', (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})

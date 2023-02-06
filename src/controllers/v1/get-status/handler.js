export default async (req, res) => {
  res.set("Content-Type", "text/plain")
  res.send({ daemon_running: true, connected_to_dht_network: true })
}

export default async (req, res) => {
  res.send({ daemon_running: true, connected_to_dht_network: true })
}

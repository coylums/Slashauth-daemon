export default async (req, res) => {
  res.set("Content-Type", "text/plain")
  // FIXME, validate these are technically "running" with middleware
  res.send({ daemon_running: true, connected_to_dht_network: true })
}

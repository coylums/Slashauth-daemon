export default async (req, res) => {
  res.set("Content-Type", "text/plain")
  // FIXME, validate these are technically "running" with middleware
  // Check `req.slashTagService.slashTag.dht`

  const { slashTagService } = req
  const isConnectedToDht = !!(slashTagService.slashTag && slashTagService.slashTag.dht)

  res.send({
    daemon_running: true,
    connected_to_dht_network: isConnectedToDht,
  })
}

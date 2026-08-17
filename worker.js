// Handles heavy background tasks to maintain UI responsiveness
self.addEventListener('message', (e) => {
  const { type, payload } = e.data;

  if (type === 'FILTER_TAXONOMY') {
    const { speciesDataset, queryTaxon, limit } = payload;
    
    const results = speciesDataset
      .filter((species) => species.taxonomyPath.includes(queryTaxon))
      .slice(0, limit || 20);

    self.postMessage({ type: 'TAXONOMY_RESULTS', payload: results });
  }

  if (type === 'COMPUTE_OBSERVATION_WEIGHTS') {
    const { observations } = payload;
    
    const weighted = observations.map((obs) => ({
      ...obs,
      score: Math.log(obs.observationCount + 1) * (obs.hasAudio ? 1.5 : 1.0)
    }));

    self.postMessage({ type: 'WEIGHTS_COMPUTED', payload: weighted });
  }
});
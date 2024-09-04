---
title: Scenarios
description: 
date: 2017-01-04
weight: 8
---

### Supported chaos scenarios

Scenario   | Description                                                      
------------------------------------------- |------------------------------------------------------------------ |
[Pod failures](docs/scenarios/pod-scenarios.md) | Injects pod failures                                         
[Container failures](docs/scenarios/container-scenarios.md) | Injects container failures based on the provided kill signal
[Node failures](docs/scenarios/node-scenarios.md) | Injects node failure through OpenShift/Kubernetes, cloud API's   
[zone outages](docs/scenarios/zone-outages.md) | Creates zone outage to observe the impact on the cluster, applications
[time skew](docs/scenarios/time-scenarios.md) | Skews the time and date                                          
[Node cpu hog](docs/scenarios/node-cpu-hog.md) | Hogs CPU on the targeted nodes
[Node memory hog](docs/scenarios/node-memory-hog.md) | Hogs memory on the targeted nodes                         
[Node IO hog](docs/scenarios/node-io-hog.md) | Hogs io on the targeted nodes                                    
[Service Disruption](docs/scenarios/service-disruption-scenarios.md) | Deleting all objects within a namespace                          
[Application outages](docs/scenarios/application-outages.md) | Isolates application Ingress/Egress traffic to observe the impact on dependent applications and recovery/initialization timing 
[Power Outages](docs/scenarios/power-outages.md) | Shuts down the cluster for the specified duration and turns it back on to check the cluster health 
[PVC disk fill](docs/scenarios/pvc-scenarios.md) | Fills up a given PersistenVolumeClaim by creating a temp file on the PVC from a pod associated with it 
[Network Chaos](docs/scenarios/network-chaos.md) | Introduces network latency, packet loss, bandwidth restriction in the egress traffic of a Node's interface using tc and Netem
[Pod Network Chaos](docs/scenarios/pod-network-chaos.md) | Introduces network chaos at pod level                            
[Service Hijacking](docs/scenarios/service-hijacking.md) | Hijacks a service http traffic to simulate custom HTTP responses 

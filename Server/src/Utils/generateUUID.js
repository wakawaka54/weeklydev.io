import uuid from 'node-uuid';

export default function() {
  return uuid.v4(uuid.nodeRNG);
};

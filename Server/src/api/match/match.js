import Boom from 'boom';

import User from '../../Models/User.js';

import { runMatch } from '../../Matching';

import * as Code from '../../Utils/errorCodes.js';

/*
 * Join a team automatically
 */

export function joinMatchmaking (req, res) {
  User.findById(req.Token.id, (err, user) => {
    if (err || !user) {
      res(Code.userNotFound);
    } else {
      if (user.verified) {
        res(Code.accountNotValidated);
      }else {
        user.isSearching = true;
        user.save(err => ((err) ? res(Boom.wrap(err)) : res({status: 'success', code: 200}).code(200)));
      }
    }
  });
};

/*
 * Get a ghost team for matchmaking
 */
export function getGhostTeams (req, res) {
  User.findById(req.Token.id).populate('ghostTeams', 'confirmed manager frontend backend score').exec((err, user) => {
    if (err || !user) {
      res(Code.userNotFound);
    }else {
      res(user.ghostTeams);
    }
  });
};

export function startMatch (req, res) {
  runMatch();
  res('Started');
};

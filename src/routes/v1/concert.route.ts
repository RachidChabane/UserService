import exp from 'constants';
import express from 'express';
import { concertController } from '../../controllers';

const router = express.Router();

router.route('/createConcert').post(concertController.createConcert);

router.route('/getConcerts').get(concertController.getConcerts);

router.route('/getConcert/:concertId').get(concertController.getConcert);

router.route('/deleteConcert/:concertId').delete(concertController.deleteConcert);

export default router;
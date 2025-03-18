import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import { concertService } from "../services";

const createConcert = catchAsync(async (req, res) => {
    const {title, location, date, maxSeats, status} = req.body;
    const concert = await concertService.createConcert(title, location, date, maxSeats, status);
    res.status(httpStatus.CREATED).send(concert);
});

const getConcerts = catchAsync(async (req, res) => {
    const concerts = await concertService.getConcerts();
    res.send(concerts);
});

const getConcert = catchAsync(async (req, res) => {
    const concert = await concertService.getConcertById(req.params.concertId);
    if (!concert) {
        throw new ApiError(httpStatus.NOT_FOUND, "Concert not found");
    }
    res.send(concert);
});

const deleteConcert = catchAsync(async (req, res) => {
    const concert = await concertService.deleteConcertById(req.params.concertId);
    if (!concert) {
        throw new ApiError(httpStatus.NOT_FOUND, "Concert not found");
    }
    res.status(200).send(concert);

});

export default {
    createConcert,
    getConcerts,
    getConcert,
    deleteConcert
};
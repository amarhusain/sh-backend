import { CreateAppointmentDto } from "../dto/user.dto";
import Appointment, { IAppointmentModel } from "../models/appointment.model";


export class AppointmentRepository {

    constructor(private appointmentModel: IAppointmentModel) { }

    async createAppointment(createAppointmentDto: CreateAppointmentDto) {
        const appointment = new this.appointmentModel(createAppointmentDto);
        return await appointment.save();
    }

    async getAllAppointment() {
        let date = new Date();
        date.setHours(0, 0, 0);
        return this.appointmentModel.find({ date: { $gte: date } });
    }
}


export const appointmentRepository = new AppointmentRepository(Appointment);
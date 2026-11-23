import { Body, Controller, HttpCode, Inject, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ConfirmUserRegistrationCommand,
  IRegistrationsModule,
  RegisterNewUserCommand,
} from '@modules/registrations';
import { REGISTRATIONS_MODULE } from '../tokens';

class RegisterNewUserRequest {
  login!: string;
  password!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  confirmLink?: string;
}

@ApiTags('Registrations')
@Controller('api/userAccess/userRegistrations')
export class UserRegistrationsController {
  constructor(
    @Inject(REGISTRATIONS_MODULE) private readonly registrationsModule: IRegistrationsModule,
  ) {}

  @Post()
  @HttpCode(200)
  async register(@Body() body: RegisterNewUserRequest) {
    const id = await this.registrationsModule.executeCommand(
      new RegisterNewUserCommand(
        body.login,
        body.password,
        body.email,
        body.firstName,
        body.lastName,
        body.confirmLink,
      ),
    );
    return { id };
  }

  @Put(':id/confirm')
  @HttpCode(200)
  async confirm(@Param('id') id: string) {
    await this.registrationsModule.executeCommand(new ConfirmUserRegistrationCommand(id));
    return { confirmed: true };
  }
}

import { User } from '../../domain/users/user';
import { UserId } from '../../domain/users/user-id';

export interface IUserRepository {
  add(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByLogin(login: string): Promise<User | null>;
}

import User from "./User";
import getUserById from "./getUserById";
import createUser from "./createUser";
import listUsers from "./listUsers";

type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    userId: string;
    user: User;
  };
};

exports.handler = async (event: AppSyncEvent) => {
  switch (event.info.fieldName) {
    case "getUserById":
      return await getUserById(event.arguments.userId);
    case "createUser":
      return await createUser(event.arguments.user);
    case "listUsers":
      return await listUsers();
    default:
      return null;
  }
};

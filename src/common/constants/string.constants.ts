export enum ErrorMessages {
  PATH_UNDEFINED = "Path is undefined or null",
  READ_DIRECTORIES = "Error reading directories",
  READ_FILES_BY_EXTENSION = "Error reading files by extension",
  FAILED_TO_LIST_FILES = "Failed to list files by extension",
  FAILED_TO_MOUNT = "Failed to mount directory",
  FAILED_TO_UNMOUNT = "Failed to unmount directory",
}

export enum SuccessMessages {
  MOUNT_SUCCESS = "Successfully mounted directory",
  UNMOUNT_SUCCESS = "Successfully unmounted directory",
}

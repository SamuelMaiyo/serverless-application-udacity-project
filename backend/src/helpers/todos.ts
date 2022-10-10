import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()
const logger = createLogger('todos')

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return todoAccess.getTodosForUser(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info('Creating new todo item')
  const itemId = uuid.v4()

  return await todoAccess.createTodo({
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false
  })
}

export async function updateTodo(
    userId: string, 
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
  ): Promise<void> {
    logger.info('Updating existing todo item')
    return await todoAccess.updateTodo(userId, todoId, {
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done
    })
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
  logger.info('Generating presigned URL for S3')
  const presignedUrl = await attachmentUtils.getUploadUrl(todoId)
  await todoAccess.updateAttachmentUrl(userId, todoId)

  return presignedUrl
}

export async function deleteTodo(userId: string, todoId: string) {
  await todoAccess.deleteTodo(userId, todoId)
}
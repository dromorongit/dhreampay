import { Types } from 'mongoose'
import { ExceptionModel } from '../models/Exception.model.js'
import { IException, CreateExceptionDTO } from '../types/exception.types.js'

interface PaginatedExceptions {
  data: IException[]
  total: number
  page: number
  limit: number
}

async function create(data: CreateExceptionDTO): Promise<IException> {
  const exception = new ExceptionModel(data)
  return exception.save()
}

async function findById(id: Types.ObjectId): Promise<IException | null> {
  return ExceptionModel.findById(id).exec()
}

async function findOne(filter: Partial<IException>): Promise<IException | null> {
  return ExceptionModel.findOne(filter).exec()
}

async function find(
  filter: Partial<IException>,
  options: { page?: number; limit?: number }
): Promise<PaginatedExceptions> {
  const page = options.page ?? 1
  const limit = options.limit ?? 10

  const [data, total] = await Promise.all([
    ExceptionModel.find(filter).skip((page - 1) * limit).limit(limit).exec(),
    ExceptionModel.countDocuments(filter).exec()
  ])

  return { data, total, page, limit }
}

async function updateById(id: Types.ObjectId, data: Partial<IException>): Promise<IException | null> {
  return ExceptionModel.findByIdAndUpdate(id, data, { new: true }).exec()
}

async function deleteById(id: Types.ObjectId): Promise<IException | null> {
  return ExceptionModel.findByIdAndDelete(id).exec()
}

export {
  create,
  findById,
  findOne,
  find,
  updateById,
  deleteById
}
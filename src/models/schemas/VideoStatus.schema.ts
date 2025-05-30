import { ObjectId } from 'mongodb'
import { EncodingStatus } from '~/constants/enum'

interface VideoStatusType {
  _id?: ObjectId
  name: string
  status?: EncodingStatus
  message?: string
  created_at?: Date
  updated_at?: Date
}

export default class VideoStatus {
  _id?: ObjectId
  name: string
  status: EncodingStatus
  message: string
  created_at: Date
  updated_at: Date

  constructor(videoStatus: VideoStatusType) {
    const date = new Date()
    this._id = videoStatus._id
    this.name = videoStatus.name
    this.status = videoStatus.status || EncodingStatus.Pending
    this.message = videoStatus.message || ''
    this.created_at = videoStatus.created_at || date
    this.updated_at = videoStatus.updated_at || date
  }
}

export type IAuthPayload = {
    name: string
}

export type IUnauthorizedException = {
    statusCode: 401
    error: 'Unauthorized'
    message: string
}

export type IBadRequestException = {
    statusCode: 400
    error: 'Bad Request'
    message: string
}

export type NyaResp<T> = (T & { statusCode: 200 })
    | IUnauthorizedException
    | IBadRequestException

export type ISignInResp = NyaResp<{
    token: string
}>

export type ISignUpResp = NyaResp<{
    _id: string
    name: string
}>

export type IRemoteArchive = {
    _id: string
    owner: string
    title: string
    wordCount: number
    public: boolean
    size: number
    accessTime: number
}

export type IArchiveGetMineResp = NyaResp<IRemoteArchive[]>

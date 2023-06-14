export type IAuthPayload = {
    name: string
}

export type IUnauthorizedException = {
    statusCode: 401
    error: 'Unauthorized'
    message: string
}

export type NyaResp<T> = (T & { statusCode: 200 }) | IUnauthorizedException

export type ISignInResp = NyaResp<{
    token: string
}>

export type ISignUpResp = NyaResp<{
    _id: string
    name: string
}>

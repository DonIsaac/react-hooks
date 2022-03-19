/**
 * @private
 * @param res
 * @returns
 */
export async function parseBody<T>(res: Response): Promise<T> {
    try {
        const contentType = res.headers.get('Content-Type') ?? ''
        if (!contentType.length || contentType.includes('application/json')) {
            return res.json()
        } else if (contentType.includes('text')) {
            return res.text() as unknown as T
        } else {
            return res.blob() as unknown as T
        }
    } catch (err) {
        return res.text() as unknown as T
    }
}

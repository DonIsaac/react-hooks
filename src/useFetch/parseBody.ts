/**
 * @private
 * @param res
 * @returns
 */
export async function parseBody(res: Response): Promise<unknown> {
    try {
        const contentType = res.headers.get('Content-Type') ?? ''
        if (!contentType.length || contentType.includes('application/json')) {
            return res.json()
        } else if (contentType.includes('text')) {
            return res.text()
        } else {
            return res.blob()
        }
    } catch (err) {
        return res.text()
    }
}

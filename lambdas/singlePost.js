exports.singlePost = async e => {
  const responseBody = {
    id: 1,
    title: `First Post - Pulumi AppSync with Lambda as DataSource ${e.arguments.id}`
  }

  return responseBody
}

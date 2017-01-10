define [
	"base"
], (App) ->
	App.directive "resolvedCommentsDropdown", (_) ->
		restrict: "E"
		templateUrl: "resolvedCommentsDropdownTemplate"
		scope: 
			entries 	: "="
			threads 	: "="
			docs		: "="
			onOpen		: "&"
			onUnresolve	: "&"
			onDelete	: "&"
			isLoading	: "="

		link: (scope, element, attrs) ->
			scope.state = 
				isOpen: false

			scope.toggleOpenState = () ->
				scope.state.isOpen = !scope.state.isOpen
				if (scope.state.isOpen)
					filterResolvedComments()
					scope.onOpen()

			scope.resolvedComments = []

			scope.handleUnresolve = (threadId) ->
				scope.onUnresolve({ threadId })
				filterResolvedComments()

			scope.handleDelete = (entryId, threadId) ->
				scope.onDelete({ entryId, threadId })
				filterResolvedComments()

			getDocNameById = (docId) ->
				doc = _.find(scope.docs, (doc) -> doc.doc.id = docId)
				if doc?
					return doc.path
				else 
					return null

			filterResolvedComments = () ->
				scope.resolvedComments = []

				for docId, docEntries of scope.entries
					for entryId, entry of docEntries
						if entry.type == "comment" and scope.threads[entry.thread_id]?.resolved?
							resolvedComment = angular.copy scope.threads[entry.thread_id]

							resolvedComment.content = entry.content
							resolvedComment.threadId = entry.thread_id
							resolvedComment.entryId = entryId
							resolvedComment.docId = docId
							resolvedComment.docName = getDocNameById(docId)

							scope.resolvedComments.push(resolvedComment)

			scope.$watchCollection "entries", filterResolvedComments
			scope.$watchCollection "threads", filterResolvedComments

						

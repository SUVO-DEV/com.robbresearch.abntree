(function() {
  var module,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  module = angular.module('angularBootstrapNavTree', ['ngSanitize']);

  module.directive('abnTree', [
    '$timeout', function($timeout) {
        return {
            restrict: 'E',
            template: "<ul class=\"nav nav-list nav-pills nav-stacked abn-tree \" ng-class=\"{'hidden-top-level-abn-tree' : showTopLevel == false}\">  <li ng-repeat=\"row in tree_rows | filter:{visible:true} track by row.branch.uid\" ng-animate=\"'abn-tree-animate'\" ng-class=\"'level-' + {{ row.level }} + (row.branch.selected ? ' active':'') + ' ' +row.classes.join(' ')\" class=\"abn-tree-row noselect\"><a id=\"{{row.branch.uid}}\" ng-click=\"user_clicks_branch($event,row.branch)\" ng-show=\"!row.branch.hideRoot\" ng-right-click=\"user_right_clicks_branch($event,row.branch)\"><i ng-class=\"row.tree_icon\" ng-click=\"row.branch.expanded = !row.branch.expanded\" class=\"indented tree-icon\" style='margin:auto'> </i><span class=\"indented tree-label\" ng-bind-html= \"row.label\" }}> </span><i class=\"fa fa-angle-right pull-right right-arrow\"></i></a></li>\n</ul>",
            replace: true,
            scope: {
                treeData: '=',
                treeVersion: '=',
                onSelect: '&',
                onShowContextMenu: '&', 
                initialSelection: '@',
                treeControl: '=',
                beforeSelect: "=",
                iconSelector: "="
            },
            link: function(scope, element, attrs) {

                var error, expand_all_parents, expand_level, for_all_ancestors, for_each_branch, get_parent, n, on_treeData_change, select_branch, selected_branch, tree;
                error = function(s) {
                    console.log('ERROR:' + s);
                    return void 0;
                };
                if (attrs.iconExpand == null) {
                    attrs.iconExpand = 'icon-plus  glyphicon glyphicon-plus  fa fa-plus';
                }
                if (attrs.iconCollapse == null) {
                    attrs.iconCollapse = 'icon-minus glyphicon glyphicon-minus fa fa-minus';
                }
                if (attrs.iconLeaf == null) {
                    attrs.iconLeaf = 'icon-file  glyphicon glyphicon-file  fa fa-file';
                }
                if (attrs.expandLevel == null) {
                    attrs.expandLevel = '3';
                }

                if(attrs.showTopLevel == "true")
                {
                    attrs.showTopLevel = true;
                }
                else
                {
                    attrs.showTopLevel = false;
                }

                scope.showTopLevel = attrs.showTopLevel;

                expand_level = parseInt(attrs.expandLevel, 10);
                if (!scope.treeData) {
                    alert('no treeData defined for the tree!');
                    return;
                }
                if (scope.treeData.length == null) {
                    if (treeData.label != null) {
                        scope.treeData = [treeData];
                    } 
                    else {
                        alert('treeData should be an array of root branches');
                        return;
                    }
                }
                for_each_branch = function(f) {
                    var do_f, root_branch, _i, _len, _ref, _results;
                    do_f = function(branch, level) {
                        var child, _i, _len, _ref, _results;
                        f(branch, level);
                        if (branch.children != null) {
                            _ref = branch.children;
                            _results = [];
                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                child = _ref[_i];
                                _results.push(do_f(child, level + 1));
                            }
                            return _results;
                        }
                    };

                    _ref = scope.treeData;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        root_branch = _ref[_i];
                        _results.push(do_f(root_branch, 1));
                    }
                    return _results;
                };

                var selected_branches = [];

                scope.select_branch = function(branch, event) {

                    var multiSelection = false;

                    var selectedBranchIndex = selected_branches.indexOf(branch);

                //NOTE : Preventing shift behaviour for now
                if(event)
                {
                    event.shiftKey = false;
                }

                if(scope.beforeSelect)
                {
                    function doConfirm(){
                        scope.select_branch(branch, event);
                    }

                    if(!scope.beforeSelect(doConfirm))
                    {
                        event.preventDefault();

                        return;
                    }
                }

                if(event && event.shiftKey && selectedBranchIndex >= 0)
                {
                    selected_branches.splice(selectedBranchIndex,1);

                    branch.selected = false;

                    return;
                }
                else if(event && event.shiftKey){
                    //logic
                    console.log("holding shift");

                    if(selected_branches.indexOf(branch) < 0)
                    {
                        selected_branches.push(branch);

                        console.log(selected_branches);
                    }

                    multiSelection = true;
                }
                else if((event && !event.shiftKey) || !branch)
                {
                    for(var i=0; i<selected_branches.length; i++)
                    {
                        var thisSelectedBranch = selected_branches[i];

                        thisSelectedBranch.selected = false;
                    }

                    selected_branches = [];

                    if(!branch)
                    {
                        return;
                    }
                }

                var selected_branch = selected_branches[0];

                if (branch !== selected_branch) {
                    if (selected_branch != null && !multiSelection) {
                        selected_branch.selected = false;
                    }
                    branch.selected = true;

                    if(!multiSelection)
                    {
                        selected_branches = [branch];
                    }

                    expand_all_parents(branch);
                    if (branch.onselect != null) {
                        console.log("using branch onselect");
                        return $timeout(function() {
                            return branch.onSelect(branch, event);
                        });
                    } 
                    else {
                        if (scope.onSelect != null) {
                            console.log("using scope onselect");
                            return $timeout(function() {
                                return scope.onSelect({
                                    branch: branch,
                                    event:event
                                });
                            });
                        }
                    }
                }
            };
            scope.show_context_menu_branch = function(event, branch) {
                if (!branch) {
                    return;
                }

                if (branch.onShowContextMenu != null) {
                    return $timeout(function() {
                        return branch.onShowContextMenu(event, branch);
                    });
                } 
                else {
                    if (scope.onShowContextMenu != null) {
                        return $timeout(function() {
                            return scope.onShowContextMenu({
                                event : event,
                                branch: branch
                            });
                        });
                    }
                }
            };
            scope.user_clicks_branch = function(event, branch) {
                scope.treeVersion++;
                if (branch !== selected_branch) {
                    return this.select_branch(branch,event);
                }
                ////////////////////////
                else if(event.target.type == "checkbox")
                {
                    return $timeout(function() {
                        return scope.onSelect({
                            branch: branch,
                            event:event
                        });
                    });
                }
            };
            scope.user_right_clicks_branch = function(event, branch) {
                return this.show_context_menu_branch(event,branch);
            };
            get_parent = function(child) {
                var parent;
                parent = void 0;
                if (child.parent_uid) {
                    for_each_branch(function(b) {
                        if (b.uid === child.parent_uid) {
                            return parent = b;
                        }
                    });
                }
            return parent;
        };
        for_all_ancestors = function(child, fn) {
            var parent;
            parent = get_parent(child);
            if (parent != null) {
                fn(parent);
                return for_all_ancestors(parent, fn);
            }
        };
        expand_all_parents = function(child) {
            return for_all_ancestors(child, function(b) {
                return b.expanded = true;
            });
        };
        scope.tree_rows = [];
        on_treeData_change = function() {
            var add_branch_to_list, root_branch, _i, _len, _ref, _results;
            for_each_branch(function(b, level) {
                if (!b.uid) {
                    return b.uid = "" + Math.random();
                }
            });
            console.log('UIDs are set.');
            for_each_branch(function(b) {
                var child, _i, _len, _ref, _results;
                if (angular.isArray(b.children)) {
                    _ref = b.children;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        child = _ref[_i];
                        _results.push(child.parent_uid = b.uid);
                    }
                return _results;
                }
            });
            scope.tree_rows = [];
            for_each_branch(function(branch) {
                var child, f;
                if (branch.children) {
                    if (branch.children.length > 0) {
                        f = function(e) {
                            if (typeof e === 'string') {
                                return {
                                    label: e,
                                    children: []
                                };
                            } 
                            else {
                                return e;
                            }
                        };
                        return branch.children = (function() {
                            var _i, _len, _ref, _results;
                            _ref = branch.children;
                            _results = [];
                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                child = _ref[_i];
                                _results.push(f(child));
                            }
                            return _results;
                        })();
                    }
                } 
                else {
                    return branch.children = [];
                }
            });
            add_branch_to_list = function(level, branch, visible) {
                var child, child_visible, tree_icon, _i, _len, _ref, _results;
                if (branch.expanded == null) {
                    branch.expanded = false;
                }
                if (branch.classes == null) {
                    branch.classes = [];
                }
                if (!branch.noLeaf && (!branch.children || branch.children.length === 0)) {
                    //////////////////// Call the icon-selector from the Admin function if it is defined ////////

                    if(scope.iconSelector)
                    {
                    tree_icon = scope.iconSelector(branch, attrs);
                    }
                    else 
                    {
                        tree_icon = attrs.iconLeaf;
                    }

                    if (__indexOf.call(branch.classes, "leaf") < 0) {
                        branch.classes.push("leaf");
                    }
                } 
                else {
                    if (branch.expanded) {
                        tree_icon = attrs.iconCollapse;
                    } 
                    else {
                        tree_icon = attrs.iconExpand;
                    }
                }
                scope.tree_rows.push({
                    level: level,
                    branch: branch,
                    label: branch.label,
                    classes: branch.classes,
                    tree_icon: tree_icon,
                    visible: visible
                });
                if (branch.children != null) {
                    _ref = branch.children;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        child = _ref[_i];
                        child_visible = visible && branch.expanded;
                        _results.push(add_branch_to_list(level + 1, child, child_visible));
                    }
                    return _results;
                }
            };
            _ref = scope.treeData;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                root_branch = _ref[_i];
                _results.push(add_branch_to_list(1, root_branch, true));
            }
            return _results;
        };

        //scope.$watch('treeData', on_treeData_change, true);
        scope.$watch('treeVersion', on_treeData_change, true);

            if (attrs.initialSelection != null) {
                for_each_branch(function(b) {
                    if (b.data.id === attrs.initialSelection) {
                    //if (b.label === attrs.initialSelection) {
                        return $timeout(function() {
                            return scope.select_branch(b);
                        });
                    }
                });
            }
            n = scope.treeData.length;
            console.log('num root branches = ' + n);
            for_each_branch(function(b, level) {
                b.level = level;

                if(b.expanded)
                {
                    return b.expanded;
                }
                return b.expanded = b.level < expand_level;
            });
            if (scope.treeControl != null) {
                if (angular.isObject(scope.treeControl)) {
                    tree = scope.treeControl;

                    tree.refresh = function()
                    {
                        scope.treeVersion++;
                    };
                    tree.reset = function()
                    {
                        for_each_branch(function(b) {
                            if(b.selected)
                            {
                                b.selected = false;
                            }
                        });
                        selected_branches = [];
                    };
            tree.expand_all = function() {
                return for_each_branch(function(b, level) {
                  return b.expanded = true;
              });
            };
            tree.collapse_all = function() {
                return for_each_branch(function(b, level) {
                  return b.expanded = false;
              });
            };
            tree.get_first_branch = function() {
                n = scope.treeData.length;
                if (n > 0) {
                  return scope.treeData[0];
              }
          };
          tree.select_first_branch = function() {
            var b;
            b = tree.get_first_branch();
            return tree.select_branch(b);
        };
        tree.get_selected_branch = function() {
            return selected_branches[0];
        };
        tree.get_parent_branch = function(b) {
            return get_parent(b);
        };
        tree.select_branch = function(b) {
            scope.select_branch(b);
            return b;
        };
        tree.get_children = function(b) {
            return b.children;
        };
        tree.select_parent_branch = function(b) {
            var p;
            if (b == null) {
              b = tree.get_selected_branch();
          }
          if (b != null) {
              p = tree.get_parent_branch(b);
              if (p != null) {
                tree.select_branch(p);
                return p;
            }
        }
    };
    tree.getExpandedBranches = function(){
        var expandedBranches = [];

        var getExpandedBranchesRecurse = function(branches)
        {
            var expandedBranches = [];

            for(var i=0; i<branches.length; i++)
            {
                var thisBranch = branches[i];

                if(thisBranch.expanded)
                {
                    var expandedBranch = {
                        data : {
                            type : thisBranch.data.type,
                            obj : thisBranch.data.obj
                        },
                        expandedChildren : []
                    };

                    expandedBranch.expandedChildren = getExpandedBranchesRecurse(thisBranch.children);

                    expandedBranches.push(expandedBranch);
                }
            }

            return expandedBranches;
        }

        if(scope.treeData && scope.treeData.length > 0)
        {
            expandedBranches = getExpandedBranchesRecurse(scope.treeData);
        }

        return expandedBranches;
    };

    tree.add_branch = function(parent, new_branch) {
        if (parent != null) {
            parent.children.push(new_branch);
            parent.expanded = true;
        } 
        else {
            scope.treeData.push(new_branch);
        }
    return new_branch;
    };
    tree.remove_branch = function(parent, b) {
        if(parent){
            parent.children.splice(parent.children.indexOf(b),1);
        }
    };
    tree.add_root_branch = function(new_branch) {
        tree.add_branch(null, new_branch);
        return new_branch;
    };
    tree.expand_branch = function(b) {
        if (b == null) {
            b = tree.get_selected_branch();
        }
        if (b != null) {
            b.expanded = true;
            return b;
        }
    };
    tree.collapse_branch = function(b) {
        if (b == null) {
            b = selected_branches[0];
        }
        if (b != null) {
            b.expanded = false;
            return b;
        }
    };
    tree.get_siblings = function(b) {
        var p, siblings;
        if (b == null) {
            b = selected_branches[0];
        }
        if (b != null) {
            p = tree.get_parent_branch(b);
            if (p) {
                siblings = p.children;
            } 
            else {
                siblings = scope.treeData;
            }
            return siblings;
        }
    };
    tree.get_next_sibling = function(b) {
        var i, siblings;
        if (b == null) {
          b = selected_branches[0];
        }
        if (b != null) {
            siblings = tree.get_siblings(b);
            n = siblings.length;
            i = siblings.indexOf(b);
            if (i < n) {
                return siblings[i + 1];
            }
        }
    };
    tree.get_prev_sibling = function(b) {
        var i, siblings;
        if (b == null) {
            b = selected_branches[0];
        }
        siblings = tree.get_siblings(b);
        n = siblings.length;
        i = siblings.indexOf(b);
        if (i > 0) {
            return siblings[i - 1];
        }
    };
    tree.select_next_sibling = function(b) {
        var next;
        if (b == null) {
            b = selected_branches[0];
        }
        if (b != null) {
            next = tree.get_next_sibling(b);
            if (next != null) {
                return tree.select_branch(next);
            }
        }
    };
    tree.select_prev_sibling = function(b) {
        var prev;
        if (b == null) {
            b = selected_branches[0];
        }
        if (b != null) {
            prev = tree.get_prev_sibling(b);
            if (prev != null) {
                return tree.select_branch(prev);
            }
        }
    };
    tree.get_first_child = function(b) {
        var _ref;
        if (b == null) {
            b = selected_branches[0];
        }
        if (b != null) {
            if (((_ref = b.children) != null ? _ref.length : void 0) > 0) {
                return b.children[0];
            }
        }
    };
    tree.get_closest_ancestor_next_sibling = function(b) {
        var next, parent;
        next = tree.get_next_sibling(b);
        if (next != null) {
            return next;
        } 
        else {
            parent = tree.get_parent_branch(b);
            return tree.get_closest_ancestor_next_sibling(parent);
        }
    };
    tree.get_next_branch = function(b) {
        var next;
        if (b == null) {
            b = selected_branches[0];
        }
        if (b != null) {
            next = tree.get_first_child(b);
            if (next != null) {
                return next;
            } 
            else {
                next = tree.get_closest_ancestor_next_sibling(b);
                return next;
            }
        }
    };
    tree.select_next_branch = function(b) {
        var next;
        if (b == null) {
            b = selected_branches[0];
        }
        if (b != null) {
            next = tree.get_next_branch(b);
            if (next != null) {
                tree.select_branch(next);
                return next;
            }
        }
    };
    tree.last_descendant = function(b) {
        var last_child;
        if (b == null) {
        }
        n = b.children.length;
        if (n === 0) {
            return b;
        } 
        else {
            last_child = b.children[n - 1];
            return tree.last_descendant(last_child);
        }
    };
    tree.get_prev_branch = function(b) {
        var parent, prev_sibling;
        if (b == null) {
            b = selected_branches[0];
        }
        if (b != null) {
            prev_sibling = tree.get_prev_sibling(b);
            if (prev_sibling != null) {
                return tree.last_descendant(prev_sibling);
            } 
            else {
                parent = tree.get_parent_branch(b);
                return parent;
            }
        }
    };
    return tree.select_prev_branch = function(b) {
        var prev;
        if (b == null) {
            b = selected_branches[0];
        }
        if (b != null) {
            prev = tree.get_prev_branch(b);
            if (prev != null) {
                tree.select_branch(prev);
                return prev;
            }
        }
    };
}
}
}
};
}
]);

}).call(this);

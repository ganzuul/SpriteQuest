<type>(<scope>): <act> <object>
#
# Fill in the sections below and delete every line you do not need. Lines that
# begin with '#' are removed by git before the message is recorded, so this
# guidance never reaches history. The subject line above must not start with
# '#', or git will strip it with the comments.
#
# <type>: feat | fix | docs | build | chore | test | render
# <act>:  explore | declare | deliver | port | amend | refuse | delete
# Subject: imperative, no trailing period, 72 characters at most.

# ── Before ────────────────────────────────────────────────────────────────
# What was true before this commit, and why could it not continue? One to
# three sentences. The constraint, not the fix. Delete for a trivial change.

<The constraint this commit responds to.>

# ── Contract ──────────────────────────────────────────────────────────────
# Path to the contract this work is measured against, or 'none'.
# 'new' means it was written before the work. A contract written after the
# code is a description: use 'none' and say so in Tier.
#   Contract status: new | amended | unchanged | none
# If you cite a contract, prove you read the current bytes:
#   git hash-object <path>
# The first 12 characters are enough. A stale hash is rejected.
# Tier is the authority this code carries.
#   Tier: exploratory | normative

Contract: <path or "none">
Contract revision: <git hash-object of the contract; delete when Contract is none>
Contract status: <new | amended | unchanged | none>
Tier: <exploratory | normative>

# ── Conformance ───────────────────────────────────────────────────────────
# One line per group of contract items, in ICS notation.
#   Y    supported
#   N    not supported        (add a Deviation)
#   n.a. not applicable       (only where the contract's Status is n.a.)
# Do not answer n.a. to avoid reporting an item as N.
# Delete the whole section when there is no contract.

Conformance
Y  <item ids>  <one-line evidence>
N  <item id>   <what is missing>

# ── Deviations ────────────────────────────────────────────────────────────
# Required for every N above. Name the item, what differs, and why.
# Delete when empty.

Deviations
- <item>: <what differs> — <why>

# ── Contract defects ──────────────────────────────────────────────────────
# Requirements the contract was missing, found while delivering. These are
# fixed by amending the contract, not by patching the code. Mark each open or
# amended. Delete when empty.

Contract defects
- D<n>: <what the contract failed to say> — <open | amended in this commit>

# ── Out of scope ──────────────────────────────────────────────────────────
# Only what a reader might otherwise assume this commit was meant to cover.
# Delete when empty.

Out of scope
- <excluded capability or path>

# ── Verification ──────────────────────────────────────────────────────────
# Commands, with their result. Not adjectives.

Verification
- <command>: <result>

# ── Next ──────────────────────────────────────────────────────────────────
# What must be true before the next step. Do not restate the roadmap.
# Delete when empty.

Next
1. <prerequisite for the next change>

# Trailer: uncomment the line below when an agent authored the change.
# Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>